function CombinatoricsGenerator() {
    // This object will store unique sorted digit strings as keys to represent a set
    let resultSet = {};

    // Define the first collection of numeric strings used for combinations
    const firstCollection = "123,234,345,456,567,678,789,111,222,333,444,555,666,777,888,999".split(',');

    // Define the second collection of numeric strings
    const secondCollection = "11,22,33,44,55,66,77,88,99".split(',');

    // Begin a series of nested loops to generate all possible combinations
    // The outer four loops iterate through the elements of the first collection
    for (let indexOne = 0; indexOne < 16; indexOne++) {
        for (let indexTwo = 0; indexTwo < 16; indexTwo++) {
            for (let indexThree = 0; indexThree < 16; indexThree++) {
                for (let indexFour = 0; indexFour < 16; indexFour++) {
                    // The innermost loop iterates through the elements of the second collection
                    for (let indexFive = 0; indexFive < 9; indexFive++) {
                        // Concatenate the selected string elements to form a raw sequence
                        let currentSequence = firstCollection[indexOne] +
                                              firstCollection[indexTwo] +
                                              firstCollection[indexThree] +
                                              firstCollection[indexFour] +
                                              secondCollection[indexFive];

                        // Process the combined string:
                        // 1. Split into individual character strings
                        // 2. Map each character string to its numerical value
                        // 3. Sort the numbers in ascending order
                        // 4. Join the sorted numbers back into a single string
                        currentSequence = currentSequence
                            .split('')
                            .map(digitChar => Number(digitChar))
                            .sort((valX, valY) => valX - valY)
                            .join('');

                        // Add the resulting unique sorted string to our result set
                        // The value `true` simply indicates presence
                        resultSet[currentSequence] = true;
                    }
                }
            }
        }
    }
    // Return the generated set of unique sorted combinations
    return resultSet;
}

// Precompute the set of all valid sorted combinations by calling the generator function
const precomputedSetOfCombos = CombinatoricsGenerator();

// Import the Node.js file system module for input operations
const fileSystemModule = require('fs');

// Read the entire input data from standard input, using UTF-8 encoding
const rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Process the raw input: remove leading/trailing whitespace and split into an array of lines
const processedInputLines = rawInputData.trim().split('\n');

// Start an infinite loop to process each line of input
while (true) {
    // If there are no more lines left in the array, break out of the loop
    if (processedInputLines.length === 0) {
        break;
    }

    // Retrieve the next line from the beginning of the array
    const currentInputLine = processedInputLines.shift();

    // Initialize an array to store the valid single-digit candidates for the current line
    let validDigitCandidates = [];

    // Iterate through all possible single digits from 1 to 9
    for (let candidateDigit = 1; candidateDigit <= 9; candidateDigit++) {
        // Convert the current input line string into an array of numbers
        let digitArrayFromLine = currentInputLine.split('').map(charToNum => Number(charToNum));

        // Append the current candidate digit to this array
        digitArrayFromLine.push(candidateDigit);

        // Sort the combined array of digits numerically in ascending order
        digitArrayFromLine.sort((firstNum, secondNum) => firstNum - secondNum);

        // Initialize a frequency counter array for digits 0-9, all set to zero
        const digitFrequencyCounters = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        // Populate the frequency counter by iterating over the sorted digit array
        digitArrayFromLine.forEach(singleDigitVal => {
            digitFrequencyCounters[singleDigitVal]++;
        });

        // Find the highest frequency of any digit in the current combination
        const highestFrequency = Math.max.apply(null, digitFrequencyCounters);

        // If any digit appears 5 or more times, this combination is invalid; skip to the next candidate digit
        if (highestFrequency >= 5) {
            continue;
        }

        // Check if the sorted string representation of the current digit combination exists in our precomputed set
        // Using Object.prototype.hasOwnProperty.call for a safer property check
        if (Object.prototype.hasOwnProperty.call(precomputedSetOfCombos, digitArrayFromLine.join(''))) {
            // If it exists, add the current candidate digit to our list of valid solutions
            validDigitCandidates.push(candidateDigit);
        }
    }

    // Output the result for the current line:
    // If no valid digits were found, print "0". Otherwise, print the valid digits joined by spaces.
    console.log((validDigitCandidates.length === 0) ? "0" : validDigitCandidates.join(' '));
}