// Obtain raw input data from the standard input stream.
const   rawData =   require('fs') .readFileSync('/dev/stdin', 'utf8')   ;

// Process the acquired data: remove leading/trailing whitespace and split into an array of lines.
let   numericInputs =   rawData.trim() .split("\n")   ;

// Begin the primary processing loop, which continues until a specific termination condition is met.
while   (true) {

    // Extract the first numerical value from the input array and convert it to a proper number.
    let   mainNumber =   Number(numericInputs.shift())   ;

    // If the extracted number is zero, it signifies the end of input, so terminate the loop.
    if   (mainNumber === 0)   {
        break   ;
    }

    // Compute the cube of the primary number for subsequent calculations.
    const   mainNumberCubed =   mainNumber * mainNumber * mainNumber   ;

    // Initialize an empty collection to store positive differences found during iteration.
    let   positiveDifferences =   []   ;

    // Outer loop: iterate downwards from 'mainNumber - 1' to 1.
    for   (let   firstIterator =   mainNumber - 1;   firstIterator > 0;   firstIterator--) {

        // Inner loop: iterate downwards from 'firstIterator' to 1.
        for   (let   secondIterator =   firstIterator;   secondIterator > 0;   secondIterator--) {

            // Calculate a temporary result based on the cubed main number and the cubes of current iterators.
            let   tempResult =   mainNumberCubed - (firstIterator * firstIterator * firstIterator) - (secondIterator * secondIterator * secondIterator)   ;

            // If the calculated temporary result is positive, add it to our collection.
            if   (tempResult > 0)   {
                positiveDifferences.push(tempResult)   ;
            }
        }
    }

    // Sort the collected positive differences in ascending order.
    positiveDifferences.sort(function(elem1,   elem2)   {
        return   elem1 - elem2   ;
    })   ;

    // Output the smallest positive difference found (which is the first element after sorting).
    console.log(positiveDifferences[0])   ;
}