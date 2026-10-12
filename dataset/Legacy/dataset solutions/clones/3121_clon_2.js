let inputData = []; // This array will store all lines read from standard input.
const primeModulus = Math.pow(10, 9) + 7; // A large prime number, often used in modular arithmetic, though not directly applied in the final calculation for this specific problem.
let finalProduct = 1; // This variable will accumulate the product of (count + 1) for each character group.

const ioModule = require('readline'); // Import the 'readline' module to handle input/output streams.

const inputHandler = ioModule.createInterface({ // Create an interface for reading input line by line.
    input: process.stdin, // Specify standard input as the source.
    output: process.stdout, // Specify standard output (though not used for writing by this interface directly).
});

inputHandler.on('line', function (currentLine) { // Attach an event listener for each line received.
    inputData.push(currentLine); // Add the current line to our collection of input data.
});

inputHandler.on('close', function () { // Attach an event listener for when the input stream ends.
    // Once all input is received and the stream closes, process the data.
    const inputLength = Number(inputData[0]); // The first line contains the integer N.
    let charArray = inputData[1].split(""); // The second line is the string, which we split into an array of characters.

    // Sort the character array alphabetically. This groups identical characters together.
    charArray.sort((charA, charB) => charA.charCodeAt(0) - charB.charCodeAt(0));

    let charCounts = []; // This array will store the counts of consecutive identical characters.
    let currentCount = 1; // Initialize a counter for the current sequence of identical characters.

    // Iterate through the sorted character array to determine counts of each character.
    for (let idx = 1; idx < inputLength; idx++) {
        // If the current character is different from the previous one, it means a new sequence has started.
        if (charArray[idx - 1] !== charArray[idx]) {
            charCounts.push(currentCount); // Store the count of the just-finished sequence.
            currentCount = 0; // Reset the counter for the new character sequence.
        }
        currentCount++; // Increment the counter for the current character.
    }

    charCounts.push(currentCount); // After the loop, add the count of the very last character sequence.

    // Calculate the final product based on the collected character counts.
    for (let loopVar = 0; loopVar < charCounts.length; loopVar++) {
        finalProduct *= (charCounts[loopVar] + 1); // Multiply the running product by (count + 1) for each group.
    }

    // Output the final calculated result, subtracting 1 as per the problem's requirement.
    console.log(finalProduct - 1);
});
