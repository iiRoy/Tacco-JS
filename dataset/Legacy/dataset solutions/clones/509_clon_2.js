process.stdin.resume();

process.stdin.setEncoding('utf8');

process.stdin.on('data', function(incomingDataBuffer) {
    // Declare variables for tracking anomaly index and current iteration
    var anomalyPosition, currentIterationIndex;

    // Process the raw input: trim whitespace and split into individual lines
    var inputLines = incomingDataBuffer.trim().split("\n");

    // Iterate through each line of the processed input
    for (var lineIterator = 0; lineIterator < inputLines.length; ++lineIterator) {
        // Declare variables for sequence length, difference change counter,
        // the number sequence itself, and two consecutive values
        var sequenceLength, differenceChangeCounter;
        var numberSequence, previousNumber, currentNumber;
        var differenceArray; // Renamed from 'map' to be more descriptive

        // Parse the first number on the current line as the sequence length
        // and advance the line iterator to the next line for the actual data
        sequenceLength = parseInt(inputLines[lineIterator++]);

        // If the parsed length is zero, terminate processing
        if (sequenceLength === 0) {
            break;
        }

        // Initialize an array to store differences between consecutive numbers
        // The size is based on the sequence length plus one for 1-based indexing
        differenceArray = new Array(sequenceLength + 1);

        // Parse the next line (which contains the actual numbers)
        // Trim whitespace and split by space to get individual number strings
        numberSequence = inputLines[lineIterator].trim().split(" ");

        // Get the second and first numbers from the sequence
        currentNumber = parseInt(numberSequence[1]);
        previousNumber = parseInt(numberSequence[0]);

        // Calculate the difference between the first two numbers and store it
        differenceArray[1] = currentNumber - previousNumber;

        // Initialize anomaly tracking variables
        anomalyPosition = 0; // Index where a difference pattern change was detected
        differenceChangeCounter = 0; // Counts how many times the difference pattern changed

        // Update previousNumber for the next iteration
        previousNumber = currentNumber;

        // Iterate through the rest of the number sequence, starting from the third element
        for (currentIterationIndex = 2; currentIterationIndex < numberSequence.length; ++currentIterationIndex) {
            // Parse the current number in the sequence
            currentNumber = parseInt(numberSequence[currentIterationIndex]);

            // Calculate the difference between the current and previous number
            differenceArray[currentIterationIndex] = currentNumber - previousNumber;

            // Check if the current difference is different from the previous difference
            if (differenceArray[currentIterationIndex] !== differenceArray[currentIterationIndex - 1]) {
                // If different, record the current index as an anomaly position
                anomalyPosition = currentIterationIndex;
                // Increment the counter for difference pattern changes
                ++differenceChangeCounter;
            }

            // Update previousNumber for the next iteration
            previousNumber = currentNumber;

            // Check for specific anomaly patterns to determine output and exit early
            // If three difference changes are detected, print the number two positions before the last anomaly
            if (differenceChangeCounter === 3) {
                console.log(numberSequence[anomalyPosition - 2]);
                return; // Exit the function immediately
            }
            // If one difference change is detected and it's not the very next element after the anomaly,
            // print the number two positions before the anomaly
            else if (differenceChangeCounter === 1 && currentIterationIndex - anomalyPosition > 1) {
                console.log(numberSequence[anomalyPosition - 2]);
                return; // Exit the function immediately
            }
        }

        // If no early exit occurred, print the number at the last detected anomaly position
        console.log(numberSequence[anomalyPosition]);
    }
});
