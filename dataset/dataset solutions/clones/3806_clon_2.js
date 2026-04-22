function  ProcessInputData(receivedText)
{
    /*
     * This function takes raw text input, parses it,
     * performs calculations, and then outputs a result.
     */

    receivedText = receivedText.split("\n") ;

    // Parse the first line to get the length of the sequence
    var sequenceLength = receivedText[0].split(" ").map(Number) ;

    // Parse the second line to get the array of integer values
    var integerValues = receivedText[1].split(" ").map(Number) ;
    
    // Initialize a counter for subarrays that meet the condition
    var matchedSubarrays = 0 ;

    // Iterate through the integerValues array with an outer loop
    for(var startPointer = 0; startPointer < sequenceLength - 1; startPointer++)
    {
        // Initialize cumulative sum and bitwise aggregation for the current subarray
        var cumulativeSum = integerValues[startPointer] ;
        var bitwiseAggregation = integerValues[startPointer] ;

        // Inner loop to extend the current subarray
        for(var endPointer = startPointer + 1; endPointer < sequenceLength; endPointer++)
        {
            // Update the cumulative sum
            cumulativeSum += integerValues[endPointer] ;
            // Update the bitwise aggregation using XOR
            bitwiseAggregation ^= integerValues[endPointer] ;

            // Check if the cumulative sum equals the bitwise aggregation
            if (cumulativeSum === bitwiseAggregation)
            {
                matchedSubarrays++ ; // Increment the counter if the condition is met
            }
        }
    }

    // Display the final computed value to the console
    console.log(matchedSubarrays + sequenceLength) ;
}