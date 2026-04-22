function processInput(rawData)
{
    // This section parses the incoming raw text data.
    const  linesOfText = rawData.split(    '\n'   );

    // Extract numerical parameters from the very first line of input.
    const   firstLineNumbers   = linesOfText[0]
        .split(' ')
        .map(    valStr => Number.parseInt(valStr)  );

    // Assign the maximum count for iteration from the parsed numbers.
    const countLimit = firstLineNumbers[0];

    // Assign the threshold value for cumulative sums.
    const targetSum = firstLineNumbers[1];

    // Parse the second line of input into an array of integer values.
    const valueArray = linesOfText[1]
        .split(' ')
        .map(   strVal => Number.parseInt(strVal)   );


    // Begin a loop to calculate running sums and check against the target.
    for (let currentIdx = 1; currentIdx <= countLimit; currentIdx++ )
    {
        // Compute the sum of elements from the start of the array up to the current index.
        let accumulatedValue = valueArray
            .slice(0, currentIdx)
            .reduce(  (currentSum, currentNum) => currentSum + currentNum  );

        // Evaluate if the current accumulated value has surpassed the predefined target sum.
        if (accumulatedValue > targetSum)
        {
            // If the sum exceeds the target, output the current index and exit the routine.
            console.log( currentIdx );
            return ; // Terminate function execution.
        }
    }
    // If the loop completes without the target sum being exceeded, output the full count limit.
    console.log(   countLimit   );
}

// Invoke the data processing function, fetching input from the standard input stream.
processInput(  require('fs').readFileSync(  '/dev/stdin',  'utf8'  )  );