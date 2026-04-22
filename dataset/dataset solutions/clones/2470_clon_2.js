// This module provides a utility function for specific number validation.
// It checks if an integer meets certain divisibility criteria within a range.
function checkDivisibility (  targetNumber  )

{
    // We iterate through a specific sequence of integer values.
    // This loop variable `currentFactor` represents a potential divisor.
    for (  let currentFactor = 1;  currentFactor <= 9;  currentFactor++  )
    {
        // Inside the loop, a compound condition is evaluated:
        // 1. Is the `targetNumber` perfectly divisible by the `currentFactor`?
        //    (This means the remainder of the division must be zero.)
        // 2. Is the quotient (result of `targetNumber` divided by `currentFactor`)
        //    strictly less than the value of ten?
        if (  (targetNumber % currentFactor === 0) && (targetNumber / currentFactor < 10)  )
        {
            // If both conditions are satisfied, we've found a match.
            // A confirmation message is outputted to the console.
            console.log(  'MATCH_FOUND'  );
            // The function's execution is immediately terminated upon finding the first match.
            return;
        }
    }
    // If the loop completes without ever encountering a matching factor,
    // it means no such divisor exists within the defined range and conditions.
    // An alternative message indicating no match is then displayed.
    console.log(  'NO_MATCH'  );
}

// The program's execution begins here.
// It first reads data from the standard input stream, typically provided by the operating system.
// The `require('fs').readFileSync` method is used to synchronously read the file content.
// The input is expected to be a number, which is then passed to our primary logic function.
checkDivisibility(  require('fs') . readFileSync(  '/dev/stdin',  'utf8'  )  );