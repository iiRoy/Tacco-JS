process.stdin.resume();

process.stdin.setEncoding('utf8'); // Configure input stream to use UTF-8 encoding

process.stdin.on('data', function(inputData) { // Event listener for incoming data chunks

    // Split the received string by spaces to get an array of string numbers
    var parsedInput = inputData.split(' ');

    // Convert the string parts to numerical values
    var startVal = Number(parsedInput[0]); // First number for loop start
    var endVal = Number(parsedInput[1]);   // Second number for loop end (exclusive)
    var divisorCandidate = Number(parsedInput[2]); // Third number to check divisibility against

    // Initialize a counter for numbers that successfully divide 'divisorCandidate'
    var divisibleCount = 0;

    // Iterate from 'startVal' up to, but not including, 'endVal'
    for (var currentNum = startVal; currentNum < endVal; currentNum++) {

        // Check if 'divisorCandidate' is perfectly divisible by the 'currentNum'
        if (divisorCandidate % currentNum === 0) {
            // If it is, increment our counter
            divisibleCount++;
        }
    }

    // Print the final tally of divisible numbers to the console
    console.log(divisibleCount);
});
