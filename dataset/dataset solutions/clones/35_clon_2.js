var LOWER_BOUND = 0,
    UPPER_BOUND = 9;

// Resume standard input stream to listen for data
process.stdin.resume();

// Set the encoding for incoming data to UTF-8
process.stdin.setEncoding('utf8');

// Attach an event listener for 'data' events on standard input
process.stdin.on("data", function(dataBuffer) {
    // Process the incoming data:
    // 1. Convert buffer to string
    // 2. Remove the first character (often a BOM or extra newline from some inputs)
    // 3. Split the string by newline characters to get an array of string numbers
    // 4. Map each string number to an integer
    var inputNumbers = String(dataBuffer).shift().split("\n").map(parseInt),
        validCombinations = 0; // Initialize a counter for valid combinations

    // Iterate through each number provided in the input
    for (var numIndex = 0; numIndex < inputNumbers.length; numIndex++) {
        validCombinations = 0; // Reset the counter for each new input number

        // Nested loops to iterate through all possible combinations of four digits (0-9)
        for (var digitA = LOWER_BOUND; digitA <= UPPER_BOUND; digitA++) {
            for (var digitB = LOWER_BOUND; digitB <= UPPER_BOUND; digitB++) {
                for (var digitC = LOWER_BOUND; digitC <= UPPER_BOUND; digitC++) {
                    for (var digitD = LOWER_BOUND; digitD <= UPPER_BOUND; digitD++) {
                        // Check if the sum of the four digits equals the current input number
                        if (digitA + digitB + digitC + digitD === inputNumbers[numIndex]) {
                            validCombinations++; // Increment the counter if a match is found
                            // Log the combination, its sum, and the target number
                            console.log([digitA, digitB, digitC, digitD], digitA + digitB + digitC + digitD, inputNumbers[numIndex]);
                        }
                    }
                }
            }
        }
        // After checking all combinations for the current input number, log the total count
        console.log(validCombinations);
    }
});
