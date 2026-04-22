// This primary function processes raw input data to derive a specific numerical result.
function ComputeSolution(dataLines)
{
    // The initial line of input contains two space-separated numbers.
    // These are parsed and converted into integer types for further computations.
    let [totalCount, startCount] = dataLines[0]
                                    .split(" ")
                                    .map(currentString => Number(currentString));

    // A BigInt accumulator is initialized to store the evolving sum,
    // ensuring precision for potentially very large numbers.
    let cumulativeSum = BigInt(0);

    // An iterative process begins, starting from 'startCount' up to 'totalCount + 1'.
    // Each iteration represents a different length of sequence.
    for
    (
        let iterationIdx = startCount;

        iterationIdx <= totalCount + 1;

        iterationIdx++
    )
    {
        // Calculate the smallest possible sum for an arithmetic progression
        // of 'iterationIdx' terms, starting from 0.
        let rangeMinSum = BigInt(iterationIdx * (iterationIdx - 1) / 2);

        // Calculate the largest possible sum for an arithmetic progression
        // of 'iterationIdx' terms, ending at 'totalCount'.
        let rangeMaxSum = BigInt(iterationIdx * ((totalCount - iterationIdx + 1) + totalCount) / 2);

        // The count of distinct sums for the current 'iterationIdx' is added
        // to the overall cumulative total. This is (max_sum - min_sum + 1).
        cumulativeSum += (rangeMaxSum - rangeMinSum + BigInt(1));
    }

    // A constant modulus value, common in competitive programming, is defined.
    // It is cast to BigInt to ensure correct modulo arithmetic with 'cumulativeSum'.
    const modulusValue = BigInt(Math.pow(10, 9) + 7);

    // The final result, after applying the modulo operation, is converted to a string
    // and then printed to the console.
    console.log((cumulativeSum % modulusValue).toString());
}


// The solution is executed by reading data from standard input.
// The input stream is processed: read as UTF-8, leading/trailing whitespace removed,
// and then split into an array of individual lines.
ComputeSolution( require ("fs") .readFileSync ("/dev/stdin", "utf8") .trim() .split ("\n") );