/*
 This JavaScript code processes multiple test cases from standard input.
 It's designed to solve a problem involving XOR operations on arrays.
 */
function Main(  input  )
{

    // The entire input data is passed as a single string.
    // It's then split into an array of strings, one for each line.
    input  =  input.split( '\n' );

    // The first line of input contains the total number of test cases.
    var  testNum  =  input[0];

    // An array to store processed test case data.
    var  tests  =  [];
    // A string to accumulate the results for all test cases.
    var  result  =  '';

    // Loop to parse and store each test case.
    for  ( i = 0 ;  i < testNum ;  i ++ )
    {
        /*
         Each test case consists of three lines:
         1. An integer (tests[i][0])
         2. A space-separated list of integers (tests[i][1])
         3. A string representing a sequence of operations (tests[i][2])
         */
        tests.push(  [
            parseInt( input[3*i+1] ) ,
            input[3*i+2].split(' ').map(  str  =>  parseInt(str, 10)  ) ,
            input[3*i+3]
        ] );
    }


    // Iterate through each test case to solve the problem.
    for ( let i = 0 ;  i < testNum ;  i++ )
    {
        var  res  =  0 ; // Variable to store the result for the current test case (0 or 1).
        var  zeroCount  =  0 ; // Counts trailing '0's in the operation string.

        // Count how many trailing '0's are in the operation string.
        while ( tests[i][2][tests[i][2].length - zeroCount - 1]  ===  '0' )
        {
            zeroCount++;
        }

        // Store the count of trailing '0's with the test case data.
        tests[i].push(zeroCount);

        // Initialize a set of possible XOR sums from the first part of operations.
        var  oriChalls  =  [0] ;
        var  cnt  =  0 ; // Counter for processing operations.

        // Process operations that are not trailing '0's.
        while ( cnt  <  tests[i][0]  -  zeroCount )
        {
            var  newChalls  =  [] ; // Temporary array for new possible XOR sums.

            // For each existing XOR sum, calculate new ones by XORing with the current operation value.
            for ( let j = 0 ;  j < oriChalls.length ;  j++ )
            {
                // Add the original sum if not already present.
                if ( newChalls.indexOf(oriChalls[j])  ===  -1 )
                {
                    newChalls.push(oriChalls[j]);
                }
                // Add the new sum (original XOR current operation value) if not already present.
                if ( newChalls.indexOf(oriChalls[j]  ^  tests[i][1][cnt])  ===  -1 )
                {
                    newChalls.push(oriChalls[j]  ^  tests[i][1][cnt]);
                }
            }
            // Update the set of possible XOR sums.
            oriChalls  =  newChalls ;
            cnt++;
        }

        // Now, evaluate if any of the final XOR sums from `newChalls` can be reduced to 0
        // by applying the remaining '0' operations.
        for ( let j = 0 ;  j < newChalls.length ;  j++ )
        {
            var  oriChoice  =  [newChalls[j]] ; // Starting point for the current `newChalls` element.
            var  ok  =  'False' ; // Flag to check if 0 is achievable.
            var  cnt1  =  tests[i][0]  -  zeroCount ; // Counter for the remaining '0' operations.

            // Process the '0' operations.
            while ( cnt1  <  tests[i][0]  &&  ok  ===  'False' )
            {
                var  newChoice  =  [] ; // Temporary array for new possible XOR sums.

                for ( let k = 0 ;  k < oriChoice.length ;  k++ )
                {
                    // Add the original choice if not already present.
                    if ( newChoice.indexOf(oriChoice[k])  ===  -1 )
                    {
                        newChoice.push(oriChoice[k]);
                    }
                    // Add the new choice (original XOR current operation value) if not already present.
                    if ( newChoice.indexOf(oriChoice[k]  ^  tests[i][1][cnt1])  ===  -1 )
                    {
                        newChoice.push(oriChoice[k]  ^  tests[i][1][cnt1]);
                    }
                }

                // Check if 0 is among the possible XOR sums.
                if ( newChoice.indexOf(0)  >=  0 )
                {
                    ok  =  'True' ; // If 0 is found, it's possible.
                }
                cnt1  ++ ; // Move to the next '0' operation.
            }

            // If after all '0' operations, 0 is not achievable, then this path leads to failure.
            if ( ok  ===  'False' )
            {
                res  =  1 ; // Set result to 1 (failure).
                break ; // No need to check other `newChalls` elements.
            }
        }
        // Append the result of the current test case to the overall result string.
        result  +=  ( '\n'  +  String(res) ) ;
    }

    // Prepare the final output string.
    result  =  result.slice(1); // Remove the leading newline.
    console.log(result); // Print the final results.
}
// Do not edit below this line. This part handles standard input/output.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));