(  function(   dataSource   ) { // Main processing function, accepts raw input content.
    var lineFragments = dataSource.
        replace(   /\n$/,   ''   ) // Remove any trailing newline character from the input.
        .split(   '\n'   )    ; // Split the input content into an array of individual lines.

    var caseCount = Number( lineFragments.shift() ); // Extract the first line, convert it to a number, and store it as the total number of test cases.

    for ( let   idx = 0;   idx < caseCount;   idx++   ) { // Iterate through each of the specified test cases.
        var currentNumbers = lineFragments
                                .shift() // Retrieve the next line representing the current test case.
                                .split(   ' '   ) // Split the line by spaces to get individual string numbers.
                                .map(   Number   )    ; // Convert each string number into an actual numeric type.

        console.log(   validateArrangement(   currentNumbers   )   )   ; // Process the current set of numbers and print the resulting validation status.
    }
})(require(   'fs'   ) .readFileSync(   '/dev/stdin',   'utf8'   ))   ; // Read the entire content of standard input as a UTF-8 string and pass it to the main function.


function validateArrangement(   inputArray   ) { // This function assesses if a given sequence of numbers adheres to specific sorting and filtering rules.

    let filteredElements = [   ]   ; // Initialize an empty array to store elements that pass the initial filtering condition.
    let currentElement   ; // A temporary variable to hold the number currently being examined.

    const initialThreshold = inputArray.shift(); // Take the very first number from the input array; it serves as a critical threshold.

    while (   currentElement = inputArray.shift()   ) { // Loop as long as there are numbers remaining in the input array.
        if (   currentElement > initialThreshold   ) { // If the current number is strictly greater than our established initial threshold,
            continue; // then this number is not considered for further processing; skip to the next.
        }
        filteredElements.push(   currentElement   )   ; // Otherwise, if it meets the condition (less than or equal to threshold), add it to our filtered collection.
    }

    let currentMaximum = -Infinity; // Initialize a variable to keep track of the largest number encountered so far within the filtered sequence.

    while (   currentElement = filteredElements.shift()   ) { // Now, iterate through the elements that successfully passed the first filter.
        if (   currentElement > currentMaximum   ) { // If the current number is strictly larger than the highest number seen up to this point in the filtered list,
            currentMaximum = currentElement; // update our record of the maximum value.
            continue; // Proceed to check the next number in the sequence.
        }
        return 'NO'; // If a number is found that is not greater than the previous maximum, it means the sequence is not strictly increasing as required.
    }

    return 'YES'; // If the loop completes without returning 'NO', it signifies that all conditions were met, and the sequence is valid.
}