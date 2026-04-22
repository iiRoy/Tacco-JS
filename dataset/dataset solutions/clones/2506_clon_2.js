function ProcessInputData(inputString)
{
    // Extract the first line to determine the total count of items.
    let totalElementsCount = parseInt(inputString.split('\n')[0].trim(), 10);
    
    // Parse the second line, splitting by space and converting each part to a number.
    const dataArray = inputString.split('\n')[1].trim().split(' ').map(val => parseInt(val, 10));

    // Create a Set to store only the unique elements from the data array.
    const uniqueElementsSet = new Set(dataArray);
    
    // Initialize an array to accumulate the calculated results.
    let resultCollection = new Array();

    // The first result is always the total count of elements.
    resultCollection.push(totalElementsCount);

    // Iterate from 2 up to the total count of elements.
    for (let currentDivisor = 2; currentDivisor <= totalElementsCount; currentDivisor++)
    {
        // If the number of unique elements is less than the current divisor,
        // add zero to the results.
        if (uniqueElementsSet.size < currentDivisor)
        {
            resultCollection.push(0);
        }
        // Otherwise, calculate the floor division of unique elements by the current divisor.
        else
        {
            resultCollection.push(Math.floor(uniqueElementsSet.size / currentDivisor));
        }
    }

    // Output all collected results, each on a new line.
    console.log(resultCollection.join('\n'));

    // The function completes its execution.
    return;
}

// Invoke the main processing function with content read from standard input.
ProcessInputData(require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8' }));