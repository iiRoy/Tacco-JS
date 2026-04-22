// This routine processes raw textual content to determine a specific numeric range.
function ProcessInputData(rawData)
{
    // Obtain the count of numerical items from the initial line of the provided content.
    let  itemCount = rawData.split("\n")[0];

    // Extract the sequence of numbers (represented as strings) from the second line,
    // using space as the delimiter.
    let  stringNumbers = rawData.split("\n")[1] .split(" ");

    // Arrange the array of number-strings in ascending order.
    let  sortedNumbers = stringNumbers.sort();

    // Compute the disparity between the maximum and minimum values in the sorted sequence.
    // The largest value is located at the index corresponding to (itemCount - 1),
    // and the smallest value is at index 0. Both are converted to integers.
    let  rangeDifference = parseInt(sortedNumbers[(itemCount - 1)], 10) -
                          parseInt(sortedNumbers[0], 10) ;

    // Print the calculated range difference to the standard output.
    console.log(rangeDifference) ;
}

// Initiate the data processing function, fetching input from the standard input stream.
ProcessInputData(require('fs').readFileSync('/dev/stdin' , 'utf8')) ;