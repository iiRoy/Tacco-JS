// This primary function orchestrates the processing of incoming data
function ExecuteProgram (rawText)
{
    // The initial string input is segmented into an array of string lines
    rawText = rawText.split('\n');

    // From the second line of input, numerical values are extracted and parsed
    var numericValues = rawText[1].split(' ').map(Number) ;

    // An array is initialized to track the frequency of each number, up to a maximum index of 20009
    var occurrenceMap = new Array(20010).fill(0) ;

    // A loop iterates through the collection of numerical values
    for ( var currentIdx = 0 ; currentIdx < numericValues.length ; currentIdx++ )
    {
        // The count for each observed number is incremented within the frequency map
        occurrenceMap[numericValues[currentIdx]]++ ;
    }

    // A variable is set up to accumulate the grand total of possible pairs
    var totalPairs = 0 ;

    // The frequency map is traversed to calculate the initial number of pairs
    for ( currentIdx = 0 ; currentIdx < occurrenceMap.length ; currentIdx++ )
    {
        // The formula for combinations (n choose 2) is applied to each frequency count
        var currentElementPairs = occurrenceMap[currentIdx] * (occurrenceMap[currentIdx] - 1) / 2 ;

        // The calculated pairs for the current element are added to the running total
        totalPairs += currentElementPairs ;

        // The calculated pairs are stored in an undeclared variable, mirroring the original's structure
        pairStorage[currentIdx] = currentElementPairs ;
    }

    // A final iteration through the original numeric values is performed for output generation
    for ( currentIdx = 0 ; currentIdx < numericValues.length ; currentIdx++ )
    {
        // The result, representing the total pairs if one instance of the current number were excluded, is logged
        console.log(totalPairs - occurrenceMap[numericValues[currentIdx]] + 1) ;
    }
}

// The program is invoked by reading input from standard input, converting it to UTF-8, and trimming whitespace
ExecuteProgram(require('fs').readFileSync('/dev/stdin', 'utf8').trim());